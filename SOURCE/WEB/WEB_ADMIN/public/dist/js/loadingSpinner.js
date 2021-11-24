/* this is all the JS, only registering custom properties here so they can be animated in CSS and nothing else */
CSS.registerProperty({
    name: '--hue',
    syntax: '<angle>',
    initialValue: '0deg',
    inherits: true });
  
  
  CSS.registerProperty({
    name: '--a',
    syntax: '<angle>',
    initialValue: '0deg',
    inherits: true });
  
  
  for (let i = 0; i < 12; i++) {
    CSS.registerProperty({
      name: `--alpha${i}`,
      syntax: '<number>',
      initialValue: 0,
      inherits: true });
  
  }