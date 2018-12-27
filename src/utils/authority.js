// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  if (isTokenExpired()) authority = [];

  return authority || [];
}

export function setAuthority(authority, token) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  if (token) {
    token.roles = proAuthority
    setToken(token)
  }
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}

export function setToken(token) {
  return localStorage.setItem('security.token', JSON.stringify(token));
}

export function getToken() {
  const tokenStr = localStorage.getItem('security.token');
  if (!tokenStr) {
    return null;
  }
  let token;
  try {
    token = JSON.parse(tokenStr);
  } catch (e) {
  }
  return token;
}

export function setTokenExpired() {
  localStorage.removeItem('security.token');
}

export function isTokenExpired() {
  const token = getToken();
  // 判断token是否过期
  if (!token) {
    return true;
  }
  const nowTime = new Date() - token.time;
  if (token.expire * 1000 > nowTime) {
    return false;
  }
  return true;
}
