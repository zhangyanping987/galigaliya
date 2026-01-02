<?php
/**
 * 许愿内容接收脚本
 * 使用方法：将此文件上传到你的服务器，然后在 script.js 中配置此文件的URL
 * 例如：const WISH_API_URL = 'https://your-domain.com/wish-receiver.php';
 */

// 设置响应头，允许跨域请求
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只接受POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => '只接受POST请求']);
    exit;
}

// 读取POST数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['wish'])) {
    http_response_code(400);
    echo json_encode(['error' => '无效的数据']);
    exit;
}

// 准备保存的数据
$wishData = [
    'wish' => $data['wish'],
    'timestamp' => $data['timestamp'] ?? date('c'),
    'date' => $data['date'] ?? date('Y-m-d H:i:s'),
    'userAgent' => $data['userAgent'] ?? '',
    'language' => $data['language'] ?? '',
    'timezone' => $data['timezone'] ?? '',
    'referrer' => $data['referrer'] ?? '',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

// 保存到文件（wishes.json）
$wishesFile = __DIR__ . '/wishes.json';

// 读取现有数据
$wishes = [];
if (file_exists($wishesFile)) {
    $existingData = file_get_contents($wishesFile);
    $wishes = json_decode($existingData, true) ?: [];
}

// 添加新许愿
$wishes[] = $wishData;

// 保存到文件
file_put_contents($wishesFile, json_encode($wishes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// 返回成功响应
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => '许愿已收到',
    'count' => count($wishes)
]);
?>

