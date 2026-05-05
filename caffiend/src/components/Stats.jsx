import { useAuth } from "../context/auth";
import {
  calculateCoffeeStats,
  calculateCurrentCaffeineLevel,
  getTopThreeCoffees,
  statusLevels,
  calculateDailyStats,
} from "../utils";
import CoffeeChart from "./CoffeeChart";
import PropTypes from "prop-types";

function StatCard(props) {
  const { lg, title, children } = props;
  return (
    <div className={"card stat-card  " + (lg ? " col-span-2" : "")}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

StatCard.propTypes = {
  lg: PropTypes.bool,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Stats() {
  const { globalData } = useAuth();
  const stats = calculateCoffeeStats(globalData);
  const dailyStats = calculateDailyStats(globalData);

  const caffeineLevel = calculateCurrentCaffeineLevel(globalData);
  let warningLevel = "high";
  if (caffeineLevel < statusLevels.low.maxLevel) {
    warningLevel = "low";
  } else if (caffeineLevel < statusLevels.moderate.maxLevel) {
    warningLevel = "moderate";
  }

  return (
    <>
      <div className="section-header">
        <i className="fa-solid fa-chart-simple" />
        <h2>Stats</h2>
      </div>
      <CoffeeChart data={dailyStats} />
      <div className="stats-grid">
        <StatCard lg title="Active Caffeine Level">
          <div className="status">
            <p>
              <span className="stat-text">{caffeineLevel}</span>mg
            </p>
            <h5
              style={{
                color: statusLevels[warningLevel].color,
                background: statusLevels[warningLevel].background,
              }}
            >
              {warningLevel}
            </h5>
          </div>
          <p>{statusLevels[warningLevel].description}</p>
        </StatCard>
        <StatCard title="Daily Caffeine">
          <p>
            <span className="stat-text">{stats.daily_caffeine}</span>mg
          </p>
        </StatCard>
        <StatCard title="Avg # of Coffees">
          <p>
            <span className="stat-text">{stats.average_coffees}</span>
          </p>
        </StatCard>
        <StatCard title="Daily Cost ($)">
          <p>
            $ <span className="stat-text">{stats.daily_cost}</span>
          </p>
        </StatCard>
        <StatCard title="Total Cost ($)">
          <p>
            $ <span className="stat-text">{stats.total_cost}</span>
          </p>
        </StatCard>
        <table className="stat-table">
          <thead>
            <tr>
              <th>Coffee Name</th>
              <th>Number of Purchase</th>
              <th>Percentage of Total</th>
            </tr>
          </thead>
          <tbody>
            {getTopThreeCoffees(globalData).map((coffee) => {
              return (
                <tr key={coffee.coffeeName}>
                  <td>{coffee.coffeeName}</td>
                  <td>{coffee.count}</td>
                  <td>{coffee.percentage}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
