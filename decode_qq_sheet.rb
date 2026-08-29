require "json"
require "base64"
require "zlib"

def varint(data, pos)
  value = 0
  shift = 0
  loop do
    raise "truncated varint" if pos >= data.bytesize || shift > 70
    byte = data.getbyte(pos)
    pos += 1
    value |= (byte & 0x7f) << shift
    return [value, pos] if byte < 0x80
    shift += 7
  end
end

def fields(data)
  out = []
  pos = 0
  while pos < data.bytesize
    key, pos = varint(data, pos)
    number = key >> 3
    wire = key & 7
    raise "bad field" if number.zero?
    case wire
    when 0
      value, pos = varint(data, pos)
      out << [number, wire, value]
    when 1
      raise "truncated fixed64" if pos + 8 > data.bytesize
      out << [number, wire, data.byteslice(pos, 8)]
      pos += 8
    when 2
      length, pos = varint(data, pos)
      raise "truncated bytes" if pos + length > data.bytesize
      out << [number, wire, data.byteslice(pos, length)]
      pos += length
    when 5
      raise "truncated fixed32" if pos + 4 > data.bytesize
      out << [number, wire, data.byteslice(pos, 4)]
      pos += 4
    else
      raise "unsupported wire #{wire}"
    end
  end
  out
end

def readable?(bytes)
  text = bytes.dup.force_encoding("UTF-8")
  return false unless text.valid_encoding? && !text.empty?
  chars = text.each_char.to_a
  good = chars.count { |c| c.match?(/[[:print:]\s]/) && c != "\u0000" }
  good.fdiv(chars.length) > 0.92
end

def walk(data, path = [], depth = 0, seen = {})
  return if depth > 14 || data.empty?
  key = [data.bytesize, data.byteslice(0, 24)]
  return if seen[key] && depth > 2
  seen[key] = true
  parsed = fields(data)
  parsed.each_with_index do |(number, wire, value), index|
    next unless wire == 2
    item_path = path + ["#{number}[#{index}]"]
    if readable?(value)
      puts "#{item_path.join(".")}\t#{value.dup.force_encoding("UTF-8").gsub("\n", "\\n")}" 
    end
    begin
      walk(value, item_path, depth + 1, seen)
    rescue StandardError
      nil
    end
  end
end

def inspect_cell_container(data, path = [], depth = 0)
  return false if depth > 12
  parsed = fields(data)
  cells = parsed.select { |number, wire, _| number == 1 && wire == 2 }
  if cells.length > 20
    puts "CONTAINER #{path.join(".")} cells=#{cells.length}"
    parsed.group_by { |number, wire, _| [number, wire] }.each do |(number, wire), items|
      sample = items.first[2]
      preview = if wire == 0
        sample
      elsif wire == 2 && readable?(sample)
        sample.dup.force_encoding("UTF-8")[0, 100]
      elsif wire == 2
        "bytes=#{sample.bytesize}"
      else
        "bytes=#{sample.bytesize}"
      end
      puts "FIELD f#{number}/w#{wire} count=#{items.length} sample=#{preview}"
    end
    [2, 3].each do |target|
      parsed.select { |number, wire, _| number == target && wire == 2 }.first(8).each_with_index do |(_, _, payload), index|
        summary = fields(payload).map do |number, wire, value|
          if wire == 0
            "f#{number}=#{value}"
          elsif wire == 2 && readable?(value)
            "f#{number}=#{value.dup.force_encoding("UTF-8").gsub("\n", "\\n")}"
          elsif wire == 2
            "f#{number}{#{(fields(value) rescue []).map { |n,w,v| w == 0 ? "#{n}:#{v}" : "#{n}:b#{v.bytesize}" }.join(",")}}"
          else
            "f#{number}<w#{wire}>"
          end
        end
        puts "AUX f#{target} #{index}: #{summary.join(" ")}"
      end
    end
    row_markers = parsed.select { |number, wire, _| number == 3 && wire == 2 }.map do |(_, _, payload)|
      fields(payload).map { |number, wire, value| [number, wire, wire == 1 ? value.unpack1("Q<") : value] }
    end
    puts "ROW_MARKERS #{row_markers.first(25).inspect}"
    if ENV["DEEP_AUX"]
      payload = parsed.find { |number, wire, _| number == 2 && wire == 2 }&.last
      dump = lambda do |bytes, indent, remaining|
        return if remaining < 0
        fields(bytes).each_with_index do |(number, wire, value), i|
          if wire == 0
            puts "#{" " * indent}#{i}: f#{number}/v=#{value}"
          elsif wire == 1
            puts "#{" " * indent}#{i}: f#{number}/fixed64=#{value.unpack1("Q<")}"
          elsif wire == 5
            puts "#{" " * indent}#{i}: f#{number}/fixed32=#{value.unpack1("L<")}"
          elsif readable?(value)
            puts "#{" " * indent}#{i}: f#{number}/s=#{value.dup.force_encoding("UTF-8").gsub("\n", "\\n")}"
          else
            puts "#{" " * indent}#{i}: f#{number}/bytes=#{value.bytesize}"
            begin
              dump.call(value, indent + 2, remaining - 1)
            rescue StandardError
              nil
            end
          end
        end
      end
      dump.call(payload, 0, 7) if payload
    end
    cells.first(35).each_with_index do |(_, _, cell), index|
      summary = fields(cell).map do |number, wire, value|
        if wire == 0
          "f#{number}=#{value}"
        elsif wire == 2 && readable?(value)
          "f#{number}=#{value.dup.force_encoding("UTF-8").gsub("\n", "\\n")}"
        elsif wire == 2
          nested = fields(value) rescue []
          text = nested.filter_map { |n, w, v| "#{n}:#{v.dup.force_encoding("UTF-8")}" if w == 2 && readable?(v) }
          "f#{number}{#{text.join("|")}}"
        else
          "f#{number}<wire#{wire}>"
        end
      end
      puts "CELL #{index}: #{summary.join(" ")}"
    end
    return true
  end
  parsed.each_with_index do |(number, wire, value), index|
    next unless wire == 2
    begin
      return true if inspect_cell_container(value, path + ["#{number}[#{index}]"] , depth + 1)
    rescue StandardError
      nil
    end
  end
  false
end

def inspect_structure(data, path = [], depth = 0)
  return if depth > 14
  parsed = fields(data)
  groups = parsed.group_by { |number, wire, _| [number, wire] }
  if parsed.length > 30 || data.bytesize > 10_000
    summary = groups.map { |(number, wire), items| "f#{number}/w#{wire}=#{items.length}" }.join(" ")
    puts "NODE #{path.join(".")} bytes=#{data.bytesize} fields=#{parsed.length} #{summary}"
  end
  parsed.each_with_index do |(number, wire, value), index|
    next unless wire == 2 && value.bytesize > 20
    begin
      inspect_structure(value, path + ["#{number}[#{index}]"] , depth + 1)
    rescue StandardError
      nil
    end
  end
end

def inspect_grid(data, path = [], depth = 0)
  return false if depth > 14
  parsed = fields(data)
  grid = parsed.select { |number, wire, _| number == 6 && wire == 2 }
  if grid.length > 100
    puts "GRID #{path.join(".")} cells=#{grid.length}"
    grid.first(60).each_with_index do |(_, _, payload), index|
      summary = fields(payload).map do |number, wire, value|
        if wire == 0
          "f#{number}=#{value}"
        elsif wire == 1
          "f#{number}/d=#{value.unpack1("E")}"
        elsif wire == 5
          "f#{number}/i32=#{value.unpack1("L<")}"
        elsif readable?(value)
          "f#{number}/s=#{value.dup.force_encoding("UTF-8").gsub("\n", "\\n")}"
        else
          "f#{number}/b=#{value.bytesize}{#{(fields(value) rescue []).map { |n,w,v| w == 0 ? "#{n}:#{v}" : "#{n}:w#{w}/#{v.bytesize}" }.join(",")}}"
        end
      end
      puts "G #{index / 27},#{index % 27}: #{summary.join(" ")}"
    end
    if ENV["GRID_VALUES"]
      grid.first(190).each_with_index do |(_, _, payload), index|
        cell = fields(payload).find { |number, wire, _| number == 3 && wire == 2 }&.last
        next unless cell
        parts = fields(cell).map do |number, wire, value|
          if wire == 0
            "f#{number}=#{value}"
          elsif wire == 2
            nested = fields(value) rescue []
            "f#{number}/hex=#{value.unpack1("H*")}/nested=#{nested.map { |n,w,v| w == 0 ? "#{n}:#{v}" : "#{n}:w#{w}:#{v.unpack1("H*")}" }.join("|")}"
          else
            "f#{number}/w#{wire}"
          end
        end
        puts "V #{index / 27},#{index % 27}: #{parts.join(" ")}"
      end
    end
    return true
  end
  parsed.each_with_index do |(number, wire, value), index|
    next unless wire == 2
    begin
      return true if inspect_grid(value, path + ["#{number}[#{index}]"] , depth + 1)
    rescue StandardError
      nil
    end
  end
  false
end

def find_grid_node(data, depth = 0)
  return nil if depth > 14
  parsed = fields(data)
  return parsed if parsed.count { |number, wire, _| number == 6 && wire == 2 } > 100
  parsed.each do |_, wire, value|
    next unless wire == 2
    begin
      found = find_grid_node(value, depth + 1)
      return found if found
    rescue StandardError
      nil
    end
  end
  nil
end

def all_strings(data, depth = 0)
  return [] if depth > 12
  output = []
  fields(data).each do |_, wire, value|
    next unless wire == 2
    if readable?(value)
      output << value.dup.force_encoding("UTF-8")
    end
    begin
      output.concat(all_strings(value, depth + 1))
    rescue StandardError
      nil
    end
  end
  output
end

def message_ref(message)
  value_field = fields(message).find { |number, wire, _| number == 2 && wire == 2 }
  return 0 unless value_field
  inner = fields(value_field[2])
  inner.find { |number, wire, _| number == 1 && wire == 0 }&.last || 0
rescue StandardError
  0
end

def extract_rows(data, width = 27)
  grid_node = find_grid_node(data)
  raise "grid not found" unless grid_node
  value_blob = grid_node.find { |number, wire, _| number == 5 && wire == 2 }&.last
  raise "value table not found" unless value_blob
  value_fields = fields(value_blob)
  shared = value_fields.select { |number, wire, _| number == 1 && wire == 2 }.map do |_, _, entry|
    raw = fields(entry).find { |number, wire, _| number == 1 && wire == 2 }&.last || ""
    raw.dup.force_encoding("UTF-8")
  end
  rich = value_fields.select { |number, wire, _| number == 2 && wire == 2 }.map do |_, _, entry|
    strings = all_strings(entry).map { |text| text.gsub(/[[:cntrl:]]/, "").strip }.reject(&:empty?).uniq
    urls = strings.flat_map { |text| text.scan(%r{https?://[^\s]+}) }.uniq
    candidates = strings.reject { |text| text.match?(%r{https?://}) || text.match?(/\A(?:[A-F0-9]{6,8}|Microsoft YaHei|Calibri|宋体|黑体)\z/i) }
    { "text" => candidates.max_by(&:length).to_s, "urls" => urls }
  end
  cells = grid_node.select { |number, wire, _| number == 6 && wire == 2 }
  rows = Array.new((cells.length.to_f / width).ceil) { Array.new(width) { { "text" => "", "urls" => [] } } }
  cells.each_with_index do |(_, _, payload), index|
    cell_blob = fields(payload).find { |number, wire, _| number == 3 && wire == 2 }&.last
    next unless cell_blob
    cell_fields = fields(cell_blob)
    type = cell_fields.find { |number, wire, _| number == 1 && wire == 0 }&.last || 0
    ref = message_ref(cell_blob)
    value = case type
    when 4
      { "text" => shared[ref].to_s, "urls" => [] }
    when 6
      rich[ref] || { "text" => "", "urls" => [] }
    else
      { "text" => "", "urls" => [] }
    end
    rows[index / width][index % width] = value
  end
  rows
end

all_matches = []

ARGV.each do |file|
  source = File.read(file)
  json = JSON.parse(source.sub(/\AclientVarsCallback\(/, "").sub(/\)\s*\z/, ""))
  blocks = json.dig("clientVars", "collab_client_vars", "initialAttributedText", "text", 0, "block_datas") || []
  blocks.each_with_index do |block, index|
    inflated = Zlib::Inflate.inflate(Base64.decode64(block.fetch("related_sheet")))
    puts "# #{file} block=#{index} bytes=#{inflated.bytesize}"
    if ENV["EXTRACT_MATCHES"]
      extract_rows(inflated).each_with_index do |row, row_index|
        company = row[1]["text"].to_s.gsub(/\s+/, " ").strip
        jobs = row[5]["text"].to_s.gsub(/\s+/, " ").strip
        next if company.empty? || jobs.empty? || !jobs.match?(/运营|产品|市场|营销/)
        links = (row[12]["urls"] + row[11]["urls"]).uniq
        categories = []
        categories << "运营" if jobs.include?("运营")
        categories << "产品" if jobs.include?("产品")
        categories << "市场" if jobs.match?(/市场|营销/)
        record = {
          "company" => company,
          "jobs" => jobs,
          "categories" => categories,
          "application_url" => links.first.to_s,
          "announcement_url" => links.drop(1).first.to_s,
          "source_block" => File.basename(file),
          "source_row" => row_index
        }
        all_matches << record
        puts [File.basename(file), row_index, company, jobs, links.join(" ")].join("\t") unless ENV["OUTPUT_JSON"]
      end
    elsif ENV["EXTRACT_ROWS"]
      puts JSON.generate(extract_rows(inflated))
    elsif ENV["INSPECT_GRID"]
      inspect_grid(inflated)
    elsif ENV["STRUCTURE"]
      inspect_structure(inflated)
    elsif ENV["INSPECT_CELLS"]
      inspect_cell_container(inflated)
    else
      walk(inflated)
    end
  end
end

if ENV["EXTRACT_MATCHES"] && ENV["OUTPUT_JSON"]
  unique = all_matches.uniq { |record| [record["company"], record["jobs"], record["application_url"]] }
  File.write(ENV.fetch("OUTPUT_JSON"), JSON.pretty_generate(unique))
  puts JSON.generate({ "rows" => unique.length, "output" => ENV.fetch("OUTPUT_JSON") })
end
