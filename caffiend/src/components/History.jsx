import { useAuth } from "../context/AuthContext";
import { calculateCurrentCaffeineLevel, coffeeConsumptionHistory, getCaffeineAmount, timeSinceConsumption } from "../utils";

export default function History() {
    const { globalData, deleteData } = useAuth()
    return (
        <>
            <div className="section-header">
                <i className="fa-solid fa-timeline" />
                <h2>History</h2>
            </div>
            <p><i>Hover for more information!</i></p>
            <div className="coffee-history">
                {Object.keys(globalData).sort((a, b) => b - a).map((utcTime, coffeeIndex) => {
                    const coffee = globalData[utcTime]
                    const timeSinceConsume = timeSinceConsumption(utcTime)
                    const originalAmount = getCaffeineAmount(coffee.name)
                    const remainingAmount = calculateCurrentCaffeineLevel({
                        [utcTime]: coffee
                    })

                    const summary = `${coffee.name} | ${timeSinceConsume} | $${coffee.cost} | ${remainingAmount}mg / ${originalAmount}mg`

                    return (
                        <div title={summary} key={coffeeIndex}>
                            <i className="fa-solid fa-mug-hot" />
                            <button 
                                onClick={() => deleteData(utcTime)} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    boxShadow: 'none', 
                                    color: 'var(--color-error)', // Assuming you have an error color variable or use 'red'
                                    padding: 0,
                                    marginLeft: '0.5rem',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fa-solid fa-trash" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </>
    )
}