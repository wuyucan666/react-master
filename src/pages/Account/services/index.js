import request from '@/utils/request';
import { getToken } from '@/utils/authority';

const modifyPassword = async params => {
  const { id } = getToken();
  return request(`/user/users/${id}/password`, {
    method: 'POST',
    body: params,
  });
};

export { modifyPassword };
