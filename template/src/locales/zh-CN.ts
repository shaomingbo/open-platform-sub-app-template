// Simplified Chinese locale.
//
// Key naming convention: `page.<sub-app>-<page>.<field>`. The
// `{{LOCALE_NS}}` placeholder expands to `page.<sub-app>-` after sed
// replacement, so e.g. `{{LOCALE_NS}}list.title` becomes
// `page.my-sub-app-list.title`. Extend below as you add pages.

export default {
  '{{LOCALE_NS}}list.title': '列表',
  '{{LOCALE_NS}}list.placeholder': '占位:列表内容',
  '{{LOCALE_NS}}list.toDetail': '占位:跳详情',
  '{{LOCALE_NS}}detail.title': '详情:{id}',
  '{{LOCALE_NS}}detail.placeholder': '占位:详情内容',
};
