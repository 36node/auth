curl -X POST https://auth.haivivi-next-uat.36node.com/sms/@sendSms \
  -H "Content-Type: application/json" \
  -H "x-api-key: abcdefg" \
  -d '{
    "phone": "15355188931",
    "sign": "冒险者科技",
    "template": "SMS_501715989",
    "params": {
      "code": "123456"
    }
  }'

curl -X POST https://localhost:9527/sms/@sendSms \
  -H "Content-Type: application/json" \
  -H "x-api-key: YHImpSchS4iEwVD1IxXp4012" \
  -d '{
    "phone": "15355188931",
    "sign": "冒险者科技",
    "template": "SMS_501715989",
    "params": {
      "code": "123456"
    }
  }'
