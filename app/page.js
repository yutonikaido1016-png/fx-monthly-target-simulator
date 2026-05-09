"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(300000);
  const [capital, setCapital] = useState(100000);
  const [pair, setPair] = useState("USDJPY");
  const [days, setDays] = useState(22);

  const pairConfig = {
    USDJPY: {
      name: "USD/JPY",
      stop: "20pips",
      lossPerLot: 20000,
      profitPerLot: 40000,
    },
    XAUUSD: {
      name: "XAU/USD",
      stop: "50pips",
      lossPerLot: 50000,
      profitPerLot: 100000,
    },
    BTCUSD: {
      name: "Bitcoin",
      stop: "500ドル幅",
      lossPerLot: 75000,
      profitPerLot: 150000,
    },
  };

  const plans = [
    { name: "安全ロット", rate: 0.02, text: "まずは安定重視" },
    { name: "成長ロット", rate: 0.05, text: "目標達成を狙う標準" },
    { name: "加速ロット", rate: 0.08, text: "短期達成を狙う攻め" },
  ];

  const data = useMemo(() => {
    const cfg = pairConfig[pair as keyof typeof pairConfig];
    const progress = target > 0 ? Math.min((capital / target) * 100, 100) : 0;
    const needProfit = Math.max(target - capital, 0);

    const results = plans.map((p) => {
      const risk = capital * p.rate;
      const lot = Math.max(risk / cfg.lossPerLot, 0.01);
      const profitPerTrade = lot * cfg.profitPerLot;
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

    return { cfg, progress, needProfit, results, score };
  }, [target, capital, pair, days]);

  const yen = (num: number) => "¥" + Math.round(num).toLocaleString();

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
        background: "#f8fafc",
      }}
    >
      {/* バナー */}
      <div
        style={{
          width: "100%",
          marginBottom: "30px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
        }}
      >
        <img
          src="/team-banner.png"
          alt="FX目標達成シミュレーター"
          style={{
            width: "100%",
            display: "block",
          }}
        />
      </div>

      {/* タイトル */}
      <section
        style={{
          background: "#ffffff",
          padding: "24px",
          borderRadius: "20px",
          marginBottom: "24px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        >
          FX 目標達成シミュレーター
        </h1>
        <p style={{ color: "#64748b" }}>
          現在資金と目標金額を入力すると、自動で最適プランを計算します。
        </p>
      </section>

      {/* 入力欄 */}
      <section
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "20px",
          marginBottom: "24px",
        }}
      >
        <h2>入力項目</h2>

        <div style={{ display: "grid", gap: "16px" }}>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            placeholder="目標金額"
          />

          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            placeholder="現在資金"
          />

          <select value={pair} onChange={(e) => setPair(e.target.value)}>
            <option value="USDJPY">USD/JPY</option>
            <option value="XAUUSD">XAU/USD</option>
            <option value="BTCUSD">Bitcoin</option>
          </select>

          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="残り日数"
          />
        </div>
      </section>

      {/* メインステータス */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Stat title="月間目標" value={yen(target)} />
        <Stat title="現在資金" value={yen(capital)} />
        <Stat title="進捗率" value={`${data.progress.toFixed(1)}%`} />
      </section>

      {/* 進捗バー */}
      <div
        style={{
          background: "#e2e8f0",
          borderRadius: "999px",
          overflow: "hidden",
          height: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: `${data.progress}%`,
            background: "#2563eb",
            height: "100%",
          }}
        />
      </div>

      {/* サマリー */}
      <section
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "20px",
          marginBottom: "24px",
        }}
      >
        <p>残り必要利益：{yen(data.needProfit)}</p>
        <p>通貨ペア：{data.cfg.name}</p>
        <p>損切り目安：{data.cfg.stop}</p>
        <p>達成スコア：{data.score}</p>
      </section>

      {/* プラン */}
      <section>
        <h2>3つの達成プラン</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "20px",
          }}
        >
          {data.results.map((p) => (
            <div
              key={p.name}
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              }}
            >
              <h3>{p.name}</h3>
              <p>{p.text}</p>

              <p>ロット目安：{p.lot.toFixed(2)} lot</p>
              <p>想定損失：{yen(p.risk)}</p>
              <p>月間必要回数：{p.monthlyTrades}回</p>
              <p>今日の目標回数：{p.dailyTrades}回</p>
              <p>今日の目標lot：{p.dailyLot.toFixed(2)} lot</p>
              <p>狙える目標金額：{yen(p.reachable)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 注意 */}
      <section
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#fff7ed",
          borderRadius: "20px",
        }}
      >
        <strong>ご利用上の注意</strong>
        <p>
          このシミュレーションは参考値です。実際の結果は相場状況により変動します。
        </p>
      </section>
    </main>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ color: "#64748b", marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
