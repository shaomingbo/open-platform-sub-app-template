// Detail page stub. Conventional dynamic route — Umi 4 uses `$<param>.tsx`
// syntax (not `[param].tsx` as Next.js does).
//
// Access the route param via `useParams<{ id: string }>()`. Rename the
// parameter (and the file) to match your sub-app's domain (e.g.
// `$deviceId.tsx` + `useParams<{ deviceId }>` if you prefer a
// domain-specific name).

import { useIntl, useParams } from '@umijs/max';
import { Space, Typography } from 'antd';

const { Title, Text } = Typography;

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        {intl.formatMessage(
          {
            id: '{{LOCALE_NS}}detail.title',
            defaultMessage: 'Detail: {id}',
          },
          { id: id ?? '' },
        )}
      </Title>
      <Text>
        {intl.formatMessage({
          id: '{{LOCALE_NS}}detail.placeholder',
          defaultMessage: 'Detail placeholder',
        })}
      </Text>
    </Space>
  );
}
