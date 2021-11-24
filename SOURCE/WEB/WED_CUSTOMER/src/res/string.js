import { useTranslation } from 'react-i18next';

const [t, i18n] = useTranslation(['translation', 'common']);

const strings = {
  home: t('home'),
  notification: t('notification'),
  user: t('user'),
  account: t('account'),
  update_user_info: t('update_user_info'),
  test: t('test'),
  name: t('name'),
  password: t('password'),
  repassword: t('repassword')
}

export default strings