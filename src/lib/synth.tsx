import { el } from '@elemaudio/core';
import { For, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

export default function Synth(props: any) {
  const core = props.core;

  const HzPerMinute = 60,
    bpm = 70;
  const gateInHz = bpm / HzPerMinute / 1;
  const delayTime = (bpm, sync, multiplier) => {
    return (60000 / bpm) * sync * multiplier;
  };

  const patch = {
    chord: [349.23, 440, 523.25],
    gate: gateInHz,
    amp: [
      { id: 0, name: 'ampEnvA', value: 0.01 },
      { id: 1, name: 'ampEnvD', value: 0.25 },
      { id: 2, name: 'ampEnvS', value: 0.0 },
      { id: 3, name: 'ampEnvR', value: 0.1 },
    ],
    filterEnv: [
      { id: 0, name: 'filtEnvA', value: 0.01 },
      { id: 1, name: 'filtEnvD', value: 0.1 },
      { id: 2, name: 'filtEnvS', value: 0.0 },
      { id: 3, name: 'filtEnvR', value: 0.1 },
    ],
    filter: [
      { id: 0, name: 'intF', value: 4000 },
      { id: 1, name: 'endF', value: 300 },
      { id: 2, name: 'res', value: 0.5 },
    ],
  };

  const [store, setStore] = createStore(patch);

  const update = (keyValue) => {
    setStore(...keyValue);
    console.log(store.amp);
    render();
  };

  let context = {};

  const playback = async (checked, action) => {
    if (Object.keys(context).length === 0) {
      context = new window.AudioContext();

      let node = await core.initialize(context, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });

      node.connect(context.destination);
    }

    if (action === 'play' && checked) {
      context.resume();
      render();
    }

    if (action === 'stop' && checked) {
      console.log('yo!!!!');
      context.suspend();
    }
  };

  // Synth

  const render = () => {
    // setStore(param, value);
    console.log(store);
    console.log(core);
    // core.render(el.cycle(440));
    // return false;

    const pulseTrain = el.train(gateInHz);

    const [aA, aD, aS, aR] = [...store.amp];

    console.log(aA.value, aD.value, aS.value, aR.value, pulseTrain);

    const env = el.adsr(aA.value, aD.value, aS.value, aR.value, pulseTrain);

    const synthVoice = (env) =>
      el.mul(
        0.25,
        el.add(
          el.mul(env, el.blepsaw(store.chord[0])),
          el.mul(env, el.blepsaw(store.chord[1])),
          el.mul(env, el.blepsaw(store.chord[2]))
        )
      );

    const test = el.lowpass(3000, 1, el.cycle(440));

    console.log(core.render(test));
    return false;

    //core.render(synthVoice(env));

    const [fA, fD, fS, fR] = [...store.filterEnv];

    console.log(fA.value, fD.value, fS.value, fR.value, pulseTrain);

    const fe = el.adsr(fA.value, fD.value, fS.value, fR.value, pulseTrain);

    // const modulation = (theIntFreq, theFilterEnv) => {
    //   return el.mul(theIntFreq, theFilterEnv);
    // };

    // const filter = (intModFreq, filtEnv, FiltQ, filtFreq, theVoice) =>
    //   el.lowpass(
    //     el.add(filtFreq, el.mul(intModFreq, filtEnv)),
    //     FiltQ,
    //     theVoice
    //   );

    const [intf, ef, q] = [...store.filter];
    console.log(intf.value, ef.value, q.value);
    // const dry = el.mul(
    //   0.25,
    //   filter(intf.value, fe, q.value, ef.value, synthVoice(env))
    // );

    const dry = el.mul(
      0.25,
      el.lowpass(
        el.add(ef.value, el.mul(intf.value, fe)),
        q.value,
        synthVoice(env)
      )
    );

    console.log(core.render(test));
  };

  return (
    <>
      <div class="playback-ui">
        <label>
          ▶
          <input
            type="radio"
            name="playback-button"
            value="play"
            onChange={(e) => {
              playback(e.currentTarget.checked, 'play');
            }}
          />
        </label>
        <label>
          ■
          <input
            type="radio"
            name="playback-button"
            value="stop"
            onChange={(e) => {
              playback(e.currentTarget.checked, 'stop');
            }}
          />
        </label>
      </div>

      <div class="synth">
        {/* Amp Envelope */}
        <For each={store.amp}>
          {(param) => (
            <div class="module">
              <div class="parameter">
                <label>{param.name}</label>
                <input
                  type="range"
                  step="0.1"
                  min="0"
                  max="4"
                  value={param.value}
                  onInput={(e) => {
                    update([
                      'amp',
                      param.id,
                      'value',
                      Number(e.currentTarget.value),
                    ]);
                  }}
                />
                <output>{param.value || 0}</output>
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="filter">
        {/* Amp Envelope */}
        <For each={store.filter}>
          {(param) => (
            <div class="module">
              <div class="parameter">
                <label>{param.name}</label>
                <input
                  type="range"
                  step="0.1"
                  min="0"
                  max="4"
                  value={param.value}
                  onInput={(e) => {
                    update([
                      'filter',
                      param.id,
                      'value',
                      Number(e.currentTarget.value),
                    ]);
                  }}
                />
                <output>{param.value || 0}</output>
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="synth">
        {/* Amp Envelope */}
        <For each={store.filterEnv}>
          {(param) => (
            <div class="module">
              <div class="parameter">
                <label>{param.name}</label>
                <input
                  type="range"
                  step="0.1"
                  min="0"
                  max="4"
                  value={param.value}
                  onInput={(e) => {
                    update([
                      'filterEnv',
                      param.id,
                      'value',
                      Number(e.currentTarget.value),
                    ]);
                  }}
                />
                <output>{param.value || 0}</output>
              </div>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
