# ExtractWisdom — Dynamic Content Extraction

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

### 1. Xem video dài nhưng không có thời gian
Bạn thấy một video YouTube 2 tiếng về AI trends. Thay vì xem hết, bạn chạy:
```
extract wisdom from https://youtube.com/watch?v=...
```
Nhận được 8-12 sections với những insight hay nhất, quotes đáng nhớ, và danh sách references để tìm hiểu thêm.

### 2. Chuẩn bị trước khi họp
Sếp gửi một bài viết dài 5,000 từ yêu cầu đọc trước buổi họp. Chạy:
```
extract wisdom (fast) from https://article-url.com
```
Nhận 3 sections, 3 bullets mỗi section. Đọc trong 30 giây, đủ context để tham gia thảo luận.

### 3. Ghi lại podcast đã nghe
Bạn vừa nghe xong một podcast episode hay nhưng sợ quên. Chạy:
```
extract wisdom from https://youtube.com/watch?v=podcast-episode
```
Skill sẽ capture những gì bạn nhớ lại và cả những gì bạn có thể đã bỏ lỡ.

### 4. Curate nội dung cho team
Bạn muốn chia sẻ một video với team nhưng cần quyết định có đáng share không:
```
extract wisdom (basic) from https://youtube.com/watch?v=...
```
Nếu output đọc xong mà bạn muốn xem video gốc, thì nó đáng share.

### 5. Research sâu một chủ đề
Bạn đang research về autonomous driving và có 5 videos cần xử lý:
```
extract wisdom (comprehensive) from https://youtube.com/watch?v=video1
```
Mức comprehensive cho 10-15 sections, bao gồm "Themes & Connections" để thấy patterns xuyên suốt nội dung.

### 6. Phân tích transcript có sẵn
Bạn có file transcript từ một buổi interview nội bộ:
```
extract wisdom from /Users/you/Documents/interview-transcript.txt
```
Không cần YouTube hay URL. Đọc file trực tiếp.

### 7. Tóm tắt nhanh trong 1 section
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
