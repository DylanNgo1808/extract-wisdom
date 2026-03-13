# ExtractWisdom — Dynamic Content Extraction

## Vấn đề

Một pain point lớn trong việc tiêu thụ nội dung: xem xong một video hay, đọc xong một bài viết dài, rồi... quên. Không biết áp dụng được gì cho công việc của mình. Kiến thức vào rồi ra.

Nhờ AI tóm tắt thì lại gặp vấn đề khác. Gemini trên YouTube hay ChatGPT summarize cho bạn một bản tóm tắt chung chung — đủ để biết video nói về gì, nhưng bỏ sót những phần hay nhất: một câu quote đáng nhớ, một quan điểm ngược dòng, một chi tiết nhỏ mà thực ra mới là thứ đáng mang đi áp dụng.

**ExtractWisdom giải quyết cả hai vấn đề:**
- Không chỉ tóm tắt mà **lọc ra wisdom** — những insights bất ngờ, quotes hay, contrarian takes mà tóm tắt thông thường bỏ qua
- Tự tạo sections theo nội dung thực tế (không phải format cố định), nên không bị sót ý quan trọng vì template không có chỗ cho nó
- Pull full transcript nên sau khi extract, bạn có thể **hỏi tiếp**: "áp dụng gì cho team mình?", "phần nào liên quan đến dự án X?" — biến nội dung thành hành động cụ thể
- Đọc xong extraction mà **muốn xem video gốc**, chứ không phải thấy "đủ rồi, skip"

---

## Hướng Dẫn Sử Dụng

### Yêu cầu cài đặt

1. **Bun** (JavaScript runtime):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **yt-dlp** (chỉ cần cho YouTube):
   ```bash
   brew install yt-dlp
   ```

3. **Claude Code** hoặc bất kỳ Claude interface nào có hỗ trợ tool calling

### Cách sử dụng

#### Bước 1: Thêm skill vào Claude Code

Copy toàn bộ folder `ExtractWisdom` vào thư mục skills của Claude Code:

```bash
cp -r ExtractWisdom ~/.claude/skills/ExtractWisdom
```

#### Bước 2: Sử dụng với các nguồn nội dung khác nhau

**YouTube video:**
```
extract wisdom from https://www.youtube.com/watch?v=VIDEO_ID
```
Claude sẽ tự động chạy `bun Tools/YouTubeTranscript.ts "URL"` để lấy transcript, sau đó phân tích.

**Bài viết / Article URL:**
```
extract wisdom from https://example.com/article
```
Claude sử dụng WebFetch (built-in) để lấy nội dung. Không cần tool nào thêm.

**File trên máy:**
```
extract wisdom from /path/to/file.txt
```
Claude đọc file trực tiếp. Không cần tool nào thêm.

**Text paste trực tiếp:**
```
extract wisdom from this:
[paste nội dung vào đây]
```
Không cần tool nào. Claude xử lý trực tiếp.

#### Tuỳ chọn: Độ sâu phân tích (không bắt buộc, mặc định là Full)

| Mức độ | Cách gọi | Số sections | Khi nào dùng |
|--------|----------|-------------|--------------|
| **Instant** | `extract wisdom (instant)` | 1 | Cần nhanh, chỉ lấy phần hay nhất |
| **Fast** | `extract wisdom (fast)` | 3 | Lướt trong 30 giây |
| **Basic** | `extract wisdom (basic)` | 3 | Tóm tắt vừa đủ |
| **Full** | `extract wisdom` (mặc định) | 5-12 | Phân tích đầy đủ |
| **Comprehensive** | `extract wisdom (comprehensive)` | 10-15 | Phân tích sâu nhất, không bỏ sót gì |

### Cấu trúc folder

```
ExtractWisdom/
├── README.md                  # File này — hướng dẫn sử dụng
├── SKILL.md                   # Định nghĩa skill, tone rules, quality check
├── Workflows_Extract.md       # Quy trình 7 bước để extract wisdom
└── Tools/
    └── YouTubeTranscript.ts   # Tool lấy transcript YouTube
```

---

## Use Cases

### 1. Discuss trực tiếp với video
Vì ExtractWisdom pull full transcript, bạn có thể hỏi tiếp sau khi extract:
```
extract wisdom from https://youtube.com/watch?v=...
```
Sau đó hỏi thêm: *"Anh ấy nói gì về pricing strategy?"*, *"Phần nào liên quan đến startup giai đoạn đầu?"*. Claude có toàn bộ transcript nên trả lời được mọi câu hỏi chi tiết về video — như đang nói chuyện với người đã xem video đó.

### 2. Reflect — mình áp dụng được gì?
Extract xong, hỏi Claude:
```
Từ những insights trên, mình có thể áp dụng gì cho [dự án/công việc/team] của mình?
```
Claude sẽ map các insights từ video vào context cụ thể của bạn. Ví dụ: xem video về cách Rivian quản lý 5,000 người cùng phát triển R2 → hỏi "áp dụng gì cho team 10 người của mình?"

### 3. Kết hợp nhiều nguồn → tạo content mới
Extract từ 2-3 nguồn khác nhau, rồi yêu cầu Claude tổng hợp:
```
extract wisdom from https://youtube.com/watch?v=video1
extract wisdom from https://youtube.com/watch?v=video2
extract wisdom from https://blog.com/article

Bây giờ viết cho mình một bài blog/thread/newsletter kết hợp insights từ 3 nguồn trên.
```
Vì Claude đã đọc full transcript của tất cả, nó có thể tìm patterns xuyên suốt, so sánh quan điểm, và tạo content hoàn toàn mới từ nhiều góc nhìn.

### 4. Research sâu một chủ đề
Đang research về autonomous driving và có 5 videos cần xử lý:
```
extract wisdom (comprehensive) from https://youtube.com/watch?v=video1
```
Mức comprehensive cho 10-15 sections, bao gồm "Themes & Connections" để thấy patterns xuyên suốt nội dung.

### 5. Curate nội dung cho team
Muốn chia sẻ một video với team nhưng cần quyết định có đáng share không:
```
extract wisdom (basic) from https://youtube.com/watch?v=...
```
Nếu output đọc xong mà bạn muốn xem video gốc, thì nó đáng share.

### 6. Tóm tắt nhanh trong 1 section
Đồng nghiệp hỏi "video này nói về gì?" và bạn cần trả lời trong 30 giây:
```
extract wisdom (instant) from https://youtube.com/watch?v=...
```
Nhận 1 section duy nhất với 8 bullets hay nhất.

---

## So sánh với các tool khác

| | ExtractWisdom | Gemini in YouTube | ChatGPT "summarize" |
|---|---|---|---|
| **Sections** | Dynamic — thay đổi theo nội dung | Cố định, chỉ tóm tắt chung | Không có structure |
| **Tone** | Conversational, như kể cho bạn nghe | Neutral, tóm tắt khô khan | Generic |
| **Depth levels** | 5 mức (Instant → Comprehensive) | 1 mức duy nhất | Không có |
| **Quotes & takes** | Giữ nguyên quotes hay, contrarian takes | Bỏ qua, chỉ tóm ý chính | Bỏ qua |
| **Dynamic sections** | Tự tạo sections theo nội dung thực tế | Không — format cố định | Không |
| **Closing sections** | Takeaway, "2 Minutes", References | Không có | Không có |
| **Dependencies** | yt-dlp + Bun | Không (built-in YouTube) | Không |
| **Input types** | YouTube, URL, file, text | Chỉ YouTube | Text only |
| **Kết quả** | Đọc xong muốn xem video | Đọc xong thấy đủ rồi, skip video | Tóm tắt chung chung |

---

## Lưu ý

- ExtractWisdom **không phải là tóm tắt**. Nó tìm wisdom — những insight bất ngờ, quotes hay, contrarian takes.
- Output được thiết kế để đọc xong bạn **muốn xem video gốc**, không phải thay thế nó.
- Skill hoạt động tốt nhất với nội dung có chiều sâu: interviews, talks, podcasts, long-form articles.
- Với nội dung ngắn hoặc đơn giản (tin tức, announcements), dùng `(instant)` hoặc `(fast)`.
