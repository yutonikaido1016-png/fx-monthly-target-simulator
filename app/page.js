"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(300000);
  const [capital, setCapital] = useState(100000);
  const [pair, setPair] = useState("USDJPY");
  const [days, setDays] = useState(22);
  const [usdJpyRate, setUsdJpyRate] = useState(155);

  const pairConfig = {
    USDJPY: {
      name: "USD/JPY",
      stop: "20pips",
      lossPerLotJPY: 20000,
      profitPerLotJPY: 40000,
    },
    XAUUSD: {
      name: "XAU/USD",
      stop: "50pips",
      lossPerLotUSD: 500,
      profitPerLotUSD: 1000,
    },
    BTCUSD: {
      name: "BTC/USD",
      stop: "500ドル幅",
      lossPerLotUSD: 1000,
      profitPerLotUSD: 2000,
    },
  };

  const plans = [
    { name: "安全ロット", rate: 0.03, text: "まずは安定重視" },
    { name: "成長ロット", rate: 0.07, text: "目標達成を狙う標準" },
    { name: "加速ロット", rate: 0.15, text: "短期達成を狙う攻め" },
  ];

  const data = useMemo(() => {
    const cfg = pairConfig[pair];

    const lossPerLot =
      pair === "USDJPY"
        ? cfg.lossPerLotJPY
        : cfg.lossPerLotUSD * usdJpyRate;

    const profitPerLot =
      pair === "USDJPY"
        ? cfg.profitPerLotJPY
        : cfg.profitPerLotUSD * usdJpyRate;

    const progress = target > 0 ? Math.min((capital / target) * 100, 100) : 0;
    const needProfit = Math.max(target - capital, 0);

    const results = plans.map((p) => {
      const risk = capital * p.rate;
      const lot = Math.max(risk / lossPerLot, 0.01);
      const profitPerTrade = lot * profitPerLot;
      const monthlyTrades =
        profitPerTrade > 0 ? Math.ceil(needProfit / profitPerTrade) : 0;
      const dailyTrades = days > 0 ? Math.ceil(monthlyTrades / days) : 0;
      const dailyLot = lot * dailyTrades;
      const reachable = capital + profitPerTrade * days;

      return {
        ...p,
        lot,
        risk,
        monthlyTrades,
        dailyTrades,
        dailyLot,
        reachable,
      };
    });

    let score = "C";
    if (progress >= 90) score = "S";
    else if (results[1].dailyTrades <= 2) score = "A";
    else if (results[1].dailyTrades <= 5) score = "B";

    return {
      cfg,
      progress,
      needProfit,
      results,
      score,
      lossPerLot,
      profitPerLot,
    };
  }, [target, capital, pair, days, usdJpyRate]);

  const yen = (num) => "¥" + Math.round(num).toLocaleString();

  return (
    <main>
      <div className="banner">
        <img src="/team-banner.png" alt="FX目標達成シミュレーター" />
      </div>

      <section className="inputCard">
        <h2>入力項目</h2>

        <label>
          1ヶ月の目標金額（円）
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </label>

        <label>
          現在資金（円）
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
          />
        </label>

        <label>
          取引通貨ペア
          <select value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="USDJPY">USD/JPY</option>
            <option value="XAUUSD">XAU/USD</option>
            <option value="BTCUSD">BTC/USD</option>
          </select>
        </label>

        <label>
          今月の残り取引日数
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>

        <label>
          現在のドル円レート
          <input
            type="number"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(Number(e.target.value))}
          />
        </label>
      </section>

      <section className="mainStats">
        <div className="stat">
          <span>月間目標金額</span>
          <strong>{yen(target)}</strong>
        </div>

        <div className="stat">
          <span>現在資金</span>
          <strong>{yen(capital)}</strong>
        </div>

        <div className="stat highlight">
          <span>進捗率</span>
          <strong>{data.progress.toFixed(1)}%</strong>
        </div>
      </section>

      <div className="progressBar">
        <div style={{ width: `${data.progress}%` }} />
      </div>

      <section className="summary">
        <div>
          <span>残り必要利益</span>
          <strong>{yen(data.needProfit)}</strong>
        </div>

        <div>
          <span>通貨ペア</span>
          <strong>{data.cfg.name}</strong>
        </div>

        <div>
          <span>損切り目安</span>
          <strong>{data.cfg.stop}</strong>
        </div>

        <div>
          <span>達成スコア</span>
          <strong>{data.score}</strong>
        </div>
      </section>

      <section className="plans">
        <h2>3つの達成プラン</h2>

        <div className="planGrid">
          {data.results.map((p) => (
            <div className="plan" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.text}</p>

              <dl>
                <div>
                  <dt>ロット目安</dt>
                  <dd>{p.lot.toFixed(2)} lot</dd>
                </div>

                <div>
                  <dt>1回の想定損失</dt>
                  <dd>{yen(p.risk)}</dd>
                </div>

                <div>
                  <dt>月間必要取引回数</dt>
                  <dd>{p.monthlyTrades}回</dd>
                </div>

                <div>
                  <dt>今日の目標回数</dt>
                  <dd>{p.dailyTrades}回</dd>
                </div>

                <div>
                  <dt>今日の目標lot</dt>
                  <dd>{p.dailyLot.toFixed(2)} lot</dd>
                </div>

                <div>
                  <dt>狙える目標金額</dt>
                  <dd>{yen(p.reachable)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="chartCard">
        <h2>目標達成イメージ</h2>

        <div className="barLabel">
          <span>現在</span>
          <span>{data.progress.toFixed(1)}%</span>
        </div>

        <div className="bigBar">
          <div style={{ width: `${data.progress}%` }} />
        </div>

        <div className="barScale">
          <span>{yen(0)}</span>
          <span>{yen(target)}</span>
        </div>
      </section>

      <section className="notice">
        <strong>ご利用上の注意</strong>
        <p>
          このシミュレーションは目標達成までの目安を確認するための参考情報です。
          XAU/USD・BTC/USDは入力されたドル円レートをもとに円換算しています。
          相場状況、スプレッド、約定、損切り幅により実際の結果は変動します。
        </p>
      </section>
    </main>
  );
}
