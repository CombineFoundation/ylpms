import type { CSSProperties } from "react";
import { YLP_2_SELECTION } from "@/config/cohorts";

const { youthLeaders, universities, cities, reportingTeam, regions, gender, faith } = YLP_2_SELECTION;

/** "YLP 2.0 cohort" section: who was selected, by region, gender and faith. */
export default function CohortSection() {
  const topStats = [
    { value: youthLeaders, label: "Youth Leaders", sub: "Selected nationwide" },
    { value: universities, label: "Universities", sub: "Public and private" },
    { value: cities, label: "Cities", sub: "Across six regions" },
    {
      value: reportingTeam.ros + reportingTeam.sros + reportingTeam.headRos,
      label: "Reporting team",
      sub: "Guiding every Youth Leader",
    },
  ];

  return (
    <section className="cohort" id="cohort">
      <div className="container">
        <div className="section-head reveal">
          <div className="eyebrow">YLP 2.0 cohort</div>
          <h2>
            {youthLeaders} Youth Leaders. {universities} universities. {cities} cities.
          </h2>
          <p>The selected cohort of YLP 2.0, broken down by where our Youth Leaders come from and who they are.</p>
        </div>

        <div className="cohort-top reveal">
          {topStats.map((stat) => (
            <div key={stat.label} className="c-stat">
              <div className="num">{stat.value}</div>
              <div className="lbl">{stat.label}</div>
              <div className="sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="cohort-grid">
          <div className="panel reveal">
            <h3>Where our Youth Leaders come from</h3>
            <p className="panel-note">
              Count and share of the {youthLeaders} selected Youth Leaders, by province or region.
            </p>
            {regions.map((region) => (
              <div key={region.name} className="bar-row">
                <div className="bar-name">{region.name}</div>
                <div className="bar-track">
                  {/* Grows to --w once the panel scrolls into view (.panel.in). */}
                  <span className="bar-fill" style={{ "--w": `${region.bar}%` } as CSSProperties} />
                </div>
                <div className="bar-val">
                  <b>{region.count}</b> &middot; {region.share}
                </div>
              </div>
            ))}
          </div>

          <div className="panel reveal">
            <h3>Who they are</h3>
            <p className="panel-note">A cohort led by women and open to every faith and background.</p>

            <div className="split">
              <h4>Gender</h4>
              <div className="split-bar">
                <span className="split-a" style={{ width: `${gender.female.bar}%` }}>
                  Female {gender.female.share}
                </span>
                <span className="split-b" style={{ width: `${gender.male.bar}%` }}>
                  Male {gender.male.share}
                </span>
              </div>
              <div className="split-legend">
                <span><i style={{ background: "var(--secondary)" }} />Female &mdash; {gender.female.count}</span>
                <span><i style={{ background: "var(--primary)" }} />Male &mdash; {gender.male.count}</span>
              </div>
            </div>

            <div className="split">
              <h4>Faith</h4>
              <div className="split-bar">
                <span className="split-a" style={{ width: `${faith.muslim.bar}%` }}>
                  Muslim {faith.muslim.share}
                </span>
                <span
                  className="split-b"
                  style={{ width: `${faith.hinduAndChristian.bar}%` }}
                  aria-label={`Hindu and Christian, ${faith.hinduAndChristian.share}`}
                />
              </div>
              <div className="split-legend">
                <span><i style={{ background: "var(--secondary)" }} />Muslim &mdash; {faith.muslim.count}</span>
                <span>
                  <i style={{ background: "var(--primary)" }} />Hindu &amp; Christian &mdash; {faith.hinduAndChristian.count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
