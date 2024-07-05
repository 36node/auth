#!/bin/bash

## Ensure you have gh/yq/jq installed
## mac
## brew install yq
## brew install gh

# 确保 yq 和 gh 已安装
if ! command -v yq &> /dev/null; then
    echo "yq could not be found"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo "gh could not be found"
    exit 1
fi

# 获取当前脚本的目录
SCRIPT_DIR=$(dirname "$(realpath "$BASH_SOURCE")")

# 定义相对于脚本目录的 secret.yml 文件路径
SECRET_FILE="$SCRIPT_DIR/secret.yml"

# 检查 secret 文件是否存在
if [[ ! -f "$SECRET_FILE" ]]; then
    echo "Secret file not found: $SECRET_FILE"
    exit 1
fi

# 读取 secret.yml 中的所有顶级键
keys=$(yq e 'keys | .[]' "$SECRET_FILE")
if [[ $? -ne 0 ]]; then
    echo "Failed to extract keys from $SECRET_FILE"
    exit 1
fi

# 遍历每一个键并设置为 GitHub secret
for key in $keys; do
    value=$(yq e ".${key}" "$SECRET_FILE")
    if [[ $? -ne 0 ]]; then
        echo "Failed to extract value for key $key from $SECRET_FILE"
        exit 1
    fi

    # 调试输出键和值
    echo "set key: ${key}"

    # 设置 GitHub secret
    echo "$value" | gh secret set "$key"
    if [[ $? -ne 0 ]]; then
        echo "Failed to set GitHub secret for key $key"
        exit 1
    fi
    # echo "$value"
done

echo "GitHub secrets have been set successfully."
