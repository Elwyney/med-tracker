process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
fetch("https://remd.egisz.rosminzdrav.ru/n2o/data/emdrRegistryList/dsMain?page=1&size=10&table_registrationDateTime_begin=2026-02-08T00%3A00%3A00&table_searchRadio_id=1&table_signPositionList=&table_signRoleList=&withCount=false", {
  "headers": {
    "accept": "*/*",
    "accept-language": "ru,en;q=0.9",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Chromium\";v=\"142\", \"YaBrowser\";v=\"25.12\", \"Not_A Brand\";v=\"99\", \"Yowser\";v=\"2.5\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "cookie": "SESSION=N2Y0YjA3MjMtOTliZi00YjQyLTg5YWYtZTY4YjdiYmZlNzk4",
    "Referer": "https://remd.egisz.rosminzdrav.ru/"
  },
  "body": null,
  "method": "GET"
}).then(res => res.json())
.then(res => console.log(res))






































































