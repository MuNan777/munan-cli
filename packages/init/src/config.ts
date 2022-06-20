const INIT_TYPE = [
  {
    name: '项目',
    value: 'project',
  },
  {
    name: '组件',
    value: 'component',
  },
  {
    name: '脚手架',
    value: 'cli',
  },
]

export default {
  COMPONENT_FILE: '.componentrc',
  TEMPLATE_TYPE_NORMAL: 'normal',
  TEMPLATE_TYPE_CUSTOM: 'custom',
  DEFAULT_TYPE: INIT_TYPE[0],
  INIT_TYPE,
}
