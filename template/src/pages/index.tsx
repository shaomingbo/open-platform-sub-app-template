// List page stub. Replace with your sub-app's actual landing page.
//
// The template ships only the bare minimum: useIntl + Title + a placeholder
// Button. Verification residue (useAccess wire-check, portal-render Modal
// spike button, dummy navigation link) lived here in the device sub-app and
// has been stripped — re-add equivalents in your sub-app if you want them.

import { useIntl } from '@umijs/max';
import { Button, Space, Typography } from 'antd';

const { Title } = Typography;

export default function ListPage() {
  const intl = useIntl();
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        {intl.formatMessage({
          id: '{{LOCALE_NS}}list.title',
          defaultMessage: 'List',
        })}
      </Title>
      <Button type="primary">
        {intl.formatMessage({
          id: '{{LOCALE_NS}}list.placeholder',
          defaultMessage: 'List placeholder',
        })}
      </Button>
    </Space>
  );
}
