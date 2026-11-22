/**
 * g1-acq.js — Ánh xạ mã sản phẩm trên trang đăng ký Google One
 * (script http-response của Shadowrocket)
 *
 * Nguyên tắc thiết kế:
 *   1. Một nhiệm vụ duy nhất — chỉ ánh xạ chuỗi mã "ID thanh toán hằng tháng gốc
 *      → ID gói ưu đãi", không thực hiện chẩn đoán hay gửi báo cáo;
 *   2. Nhận biết danh mục — trước tiên thu thập các mã gói ưu đãi thực sự có trong
 *      nội dung phản hồi (kết thúc bằng acq). Nếu mã đích không có nhưng mã dự
 *      phòng có trong danh mục, tự động chuyển sang mã dự phòng để tránh trỏ tới
 *      một sản phẩm không tồn tại;
 *   3. Tách dữ liệu — toàn bộ ánh xạ được tập trung trong hai bảng SKU_MAP / FALLBACK.
 *      Khi thêm hoặc xóa cấp gói, chỉ cần chỉnh sửa các bảng này.
 *
 * Phiên bản: v6
 */
"use strict";

console.log("[g1-acq] v6 loaded");

/* Mã mua hàng iOS gốc → mã gói ưu đãi đích */
var SKU_MAP = {
  "g1.ios.20tb.m.v2":     "g1.20tb.3months_ip_90p.acq",
  "g1.ios.30tb.ai.pro.m": "g1.ai.ultra.3months_ip_90p.acq"
};

/* Mã dự phòng khi mã đích không có trong danh mục
   (cộng đồng ghi nhận mã 75p từng xuất hiện trong danh mục Play/iOS) */
var FALLBACK = {
  "g1.20tb.3months_ip_90p.acq":     "g1.20tb.3months_ip_75p.acq",
  "g1.ai.ultra.3months_ip_90p.acq": "g1.ai.ultra.3months_ip_75p.acq"
};

function occurrences(s, needle) {
  return needle ? s.split(needle).length - 1 : 0;
}

function run() {
  var body = $response && $response.body;
  if (typeof body !== "string" || body === "") {
    $done({});
    return;
  }

  /* Danh mục gói ưu đãi thực sự có trong phản hồi */
  var raw = body.match(/g1\.[a-z0-9._]{2,60}acq/g) || [];
  var seen = {};
  var catalog = [];
  for (var r = 0; r < raw.length; r++) {
    if (!seen[raw[r]]) { seen[raw[r]] = 1; catalog.push(raw[r]); }
  }
  console.log("[g1-acq] Gói ưu đãi trong danh mục: " + (catalog.join(", ") || "không có"));

  var out = body, total = 0;
  var froms = Object.keys(SKU_MAP);
  for (var k = 0; k < froms.length; k++) {
    var from = froms[k];
    var n = occurrences(out, from);
    if (n === 0) continue;

    var to = SKU_MAP[from];
    if (catalog.indexOf(to) === -1 && FALLBACK[to] && catalog.indexOf(FALLBACK[to]) !== -1) {
      console.log("[g1-acq] Gói chính không có trong danh mục, chuyển sang dự phòng " + to + " -> " + FALLBACK[to]);
      to = FALLBACK[to];
    }

    out = out.split(from).join(to);
    total += n;
    console.log("[g1-acq] " + from + " -> " + to + " x" + n);
  }

  console.log(total ? "[g1-acq] Đã thay thế " + total + " vị trí" : "[g1-acq] Không tìm thấy mã cần thay");
  $done(total ? { body: out } : {});
}

run();
