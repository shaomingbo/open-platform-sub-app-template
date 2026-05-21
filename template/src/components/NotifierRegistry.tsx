// React-tree → module bridge for antd 6 message/modal/notification hook
// instances.
//
// Mounted in src/layouts/index.tsx (Umi 4 conventional global layout),
// which is inside max.antd's plugin-antd <App/> wrapper. Its only job is
// the useEffect that pushes the hook instances into @/utils/notifier so
// non-React callers (axios interceptors, error reporters, etc.) can call
// notifier.message/.modal/.notification.
//
// See @/utils/notifier file header for the two trade-offs (empty-window
// fallback proxy + double-mount overwrite).

import { App } from 'antd';
import { useEffect } from 'react';
import { registerNotifier } from '@/utils/notifier';

export function NotifierRegistry(): null {
  const { message, modal, notification } = App.useApp();

  useEffect(() => {
    registerNotifier({ message, modal, notification });
  }, [message, modal, notification]);

  return null;
}
