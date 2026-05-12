"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(300000);
  const [capital, setCapital] = useState(100000);
  const [pair, setPair] = useState("USDJPY");
  const [usdJpyRate, setUsdJpyRate] = useState(155);
  const [winRateInput, setWinRateInput] = useState(40);
  const [rewardRisk, setRewardRisk] = useState(2);

  const monthlyTradingDays = 22;

  const pairConfig = {
    USDJPY: {
      name: "USD/JPY",
      stop: "20pips",
      plans: { safe: 0.1, growth: 0.3, boost: 0.8 },
      lossPerLotJPY: 20000,
    },
    XAUUSD: {
      name: "XAU/USD",
      stop: "50pips",
      plans: { safe: 0.05, growth: 0.15, boost: 0.4 },
      lossPerLotUSD: 500,
    },
    BTCUSD: {
      name: "BTC/USD",
      stop: "500ドル幅",
      plans: { safe: 0.01, growth: 0.03, boost: 0.08 },
      lossPerLotUSD: 1000,
    },
  };

  const data = useMemo(() => {
    const cfg = pairConfig[pair];
    const winRate = winRateInput / 100;

    const lossPerLot =
      pair === "USDJPY"
        ? cfg.lossPerLotJPY
        : cfg.lossPerLotUSD * usdJpyRate;

    const progress = target > 0 ? Math.min((capital / target) * 100, 100) : 0;
    const needProfit = Math.max(target - capital, 0);

    const plans = [
      { name: "安全ロット", lot: cfg.plans.safe, text: "まずは安定重視" },
      { name: "成長ロット", lot: cfg.plans.growth, text: "目標達成を狙う標準" },
      { name: "加速ロット", lot: cfg.plans.boost, text: "短期達成を狙う攻め" },
    ];

    const results = plans.map((p) => {
      const lossAmount = p.lot * lossPerLot;
      const profitAmount = lossAmount * rewardRisk;
      const expectancy = winRate * profitAmount - (1 - winRate) * lossAmount;
      const riskPercent = capital > 0 ? (lossAmount / capital) * 100 : 0;

      const dailyTrades =
        expectancy > 0
          ? Math.ceil(needProfit / expectancy / monthlyTradingDays)
          : 0;

      const dailyLot = p.lot * dailyTrades;
      const reachable = capital + expectancy * dailyTrades * monthlyTradingDays;

      return {
        ...p,
        lossAmount,
        profitAmount,
        expectancy,
        riskPercent,
        dailyTrades,
        dailyLot,
        reachable,
      };
    });

    let score = "C";
    if (progress >= 90) score = "S";
    else if (results[1].dailyTrades <= 2) score = "A";
    else if (results[1].dailyTrades <= 5) score = "B";

    return { cfg, progress, needProfit, results, score };
  }, [target, capital, pair, usdJpyRate, winRateInput, rewardRisk]);

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
          現在のドル円レート
          <input
            type="number"
            value={usdJpyRate}
            onChange={(e) => setUsdJpyRate(Number(e.target.value))}
          />
        </label>

        <label>
          想定勝率（%）
          <input
            type="number"
            value={winRateInput}
            onChange={(e) => setWinRateInput(Number(e.target.value))}
          />
        </label>

        <label>
          想定RR（1:2なら2）
          <input
            type="number"
            step="0.1"
            value={rewardRisk}
            onChange={(e) => setRewardRisk(Number(e.target.value))}
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
          <span>勝率 / RR</span>
          <strong>{winRateInput}% / 1:{rewardRisk}</strong>
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
                  <dt>固定ロット</dt>
                  <dd>{p.lot.toFixed(2)} lot</dd>
                </div>

                <div>
                  <dt>1回の想定損失</dt>
                  <dd>{yen(p.lossAmount)}</dd>
                </div>

                <div>
                  <dt>1回の想定利益</dt>
                  <dd>{yen(p.profitAmount)}</dd>
                </div>

                <div>
                  <dt>1回あたり期待値</dt>
                  <dd className="expectancyRed">{yen(p.expectancy)}</dd>
                </div>

                <div>
                  <dt>資金に対する損失率</dt>
                  <dd>{p.riskPercent.toFixed(1)}%</dd>
                </div>

                <div>
                  <dt>今日の目標回数</dt>
                  <dd className="dailyTradesRed">{p.dailyTrades}回</dd>
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
          このシミュレーションは、入力された勝率・リスクリワードを前提に、
          1回あたりの期待値から今日の目標回数を算出しています。
          今日の目標回数は、月間22営業日を想定して日割り計算しています。
          XAU/USD・BTC/USDは入力されたドル円レートをもとに円換算しています。
          実際の結果は相場状況、スプレッド、約定、損切り幅により変動します。
        </p>
      </section>
    </main>
  );
}
