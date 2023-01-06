import type { Component } from 'solid-js';

import WebRenderer from '@elemaudio/web-renderer';

import Synth from './lib/synth';
import styles from './App.module.css';

const App: Component = () => {
  let core = new WebRenderer();

  return (
    <div class={styles.App}>
      <h1>Simple Synth - Interactive</h1>
      <Synth core={core} />
    </div>
  );
};

export default App;
