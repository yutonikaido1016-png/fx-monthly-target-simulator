"use client";

import { useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(300000);
  const [capital, setCapital] = useState(100000);

  const progress = Math.min((capital / target) * 100, 100);
  const neededProfit = target - capital;
  const lot = Math.max((capital * 0.05) / 20000, 0.01);
  const trades = Math.ceil(neededProfit / (lot * 40000));

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1>FX目標達成シミュレーター</h1>

      <div>
        <label>1ヶ月の目標金額</label>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
      </div>

      <div>
        <label>現在資金</label>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
        />
      </div>

      <hr />

      <h2>進捗率：{progress.toFixed(1)}%</h2>
      <h2>残り必要利益：¥{neededProfit.toLocaleString()}</h2>
      <h2>適正ロット：{lot.toFixed(2)} lot</h2>
      <h2>必要取引回数（月間）：{trades}回</h2>
    </main>
  );
}
