"use client";

import React, { useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(300000);
  const [capital, setCapital] = useState(100000);

  const progress = ((capital / target) * 100).toFixed(1);
  const neededProfit = target - capital;
  const lot = ((capital * 0.05) / 20000).toFixed(2);
  const trades = Math.ceil(neededProfit / (Number(lot) * 40000));

  return (
    <div style={{ padding: "20px" }}>
      <h1>FX目標達成シミュレーター</h1>

      <div>
        <p>目標金額</p>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
      </div>

      <div>
        <p>現在資金</p>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
        />
      </div>

      <hr />

      <p>進捗率：{progress}%</p>
      <p>残り必要利益：¥{neededProfit.toLocaleString()}</p>
      <p>適正ロット：{lot} lot</p>
      <p>月間必要取引回数：{trades}回</p>
    </div>
  );
}
