import Prism from 'prismjs';

// Some Prism language modules expect a global `Prism` object at import time.
if (typeof window !== 'undefined' && !window.Prism) {
  window.Prism = Prism;
}

export default {
  config: {
    locales: [],
  },
  bootstrap() {},
};
