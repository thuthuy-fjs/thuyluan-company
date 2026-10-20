import { coreValues } from "../data";

export default function CoreValuesBoard() {
  return (
    <div className="core-values-board">
      <ol className="core-values-grid">
        {coreValues.map((value, index) => (
          <li key={value.title} className="core-value">
            <span className="core-value-number" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </li>
        ))}
      </ol>
      <div className="core-values-badge" aria-hidden="true">
        <span>Giá trị</span>
        <strong>Cốt lõi</strong>
        <small>của Thúy Luân</small>
      </div>
    </div>
  );
}
