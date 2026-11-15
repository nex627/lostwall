#!/usr/bin/env bash
# 打包出一个可直接部署到 ciyuannav.com/lostwall/ 的静态目录
#
# 用法：
#   bash scripts/deploy-ciyuannav.sh            # 只生成产物到 .deploy/lostwall/
#   bash scripts/deploy-ciyuannav.sh --deploy   # 生成并上传（需先 cloudbase login）
#
# 站点用的是相对路径，放在 /lostwall/ 子目录下不会 404。
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_ID="${ENV_ID:-tokennav-d5g9f29bh451cb17b}"
CLOUD_PATH="${CLOUD_PATH:-/lostwall}"
OUT=".deploy/lostwall"

if [ ! -f index.html ]; then
  echo "× 找不到 index.html，请在仓库根目录运行" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT/src"
cp index.html styles.css "$OUT"/
cp src/*.js "$OUT/src/"

echo "✓ 产物: $OUT"
echo "  文件 $(find "$OUT" -type f | wc -l) 个，共 $(du -sh "$OUT" | cut -f1)"
echo "  环境: $ENV_ID   路径: $CLOUD_PATH"

if [ "${1:-}" = "--deploy" ]; then
  echo "→ 上传中…"
  cloudbase hosting deploy "$OUT" "$CLOUD_PATH" -e "$ENV_ID"
  echo "✓ 完成：https://ciyuannav.com${CLOUD_PATH}/"
else
  echo
  echo "下一步：cloudbase login  然后  bash scripts/deploy-ciyuannav.sh --deploy"
fi
