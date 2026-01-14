import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: 'var(--background-muted)',
                border: '1px solid var(--border-primary)',
                padding: '1rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
                <p className="label" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
                <p className="" style={{ color: 'var(--color-link)' }}>
                    Caffeine: {payload[0].value}mg
                </p>
                <p className="" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Cost: ${payload[0].payload.cost}
                </p>
            </div>
        );
    }
    return null;
}

export default function CoffeeChart(props) {
    const { data } = props

    return (
        <div style={{
            width: '100%',
            height: '300px',
            marginTop: '2rem',
            marginBottom: '2rem',
            minWidth: '250px',
            display: 'block',
            backgroundColor: 'var(--background-muted)',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-secondary)'
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data && data.length > 0 ? data : []}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" opacity={0.3} />
                    <XAxis 
                        dataKey="date" 
                        stroke="var(--color-primary)" 
                        fontSize={12} 
                        tickMargin={10} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="var(--color-primary)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}mg`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-link)', strokeWidth: 2, opacity: 0.5 }} />
                    <Line 
                        type="monotone" 
                        dataKey="caffeine" 
                        stroke="var(--color-link)" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--background-primary)', stroke: 'var(--color-link)', strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: 'var(--color-link)' }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
