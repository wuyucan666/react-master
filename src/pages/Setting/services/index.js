import request from '../../../utils/request';

export async function queryConfigRoots() {
  return request(`/config/root:config:roots?all=1`);
}

export async function queryConfigHKey(hkey) {
  return request(`/config/${hkey}?all=1`);
}

export async function saveConfigValue(params) {
  let url = ''
  if(params.root && params.key){
    url = `/config/${params.root}/${params.key}`
  }else{
    url = `/config/${params.root}`
  }
  return request(url, {
    method: 'POST',
    body: {value:params.value},
  });
}

export async function deleteConfig(params) {
  let url = ''
  if(params.root && params.key){
    url = `/config/${params.root}/${params.key}`
  }else{
    url = `/config/${params.root}`
  }
  return request(url, {
    method: 'DELETE',
  });
}
