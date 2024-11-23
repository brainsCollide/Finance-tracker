const UpcomingBills = () => {
    const payments = [
        { title: 'Electricity Bill', amount: 500000, dueDate: '25 Nov' },
        { title: 'Internet Bill', amount: 300000, dueDate: '30 Nov' },
        { title: 'Water Bill', amount: 150000, dueDate: '1 Dec' },
    ];

    return (
        <div className="bg-white rounded-md p-4 max-h-40 overflow-y-auto">
            <h2 className="font-medium mb-2 text-sm">Upcoming Payments</h2>
            {payments.length > 0 ? (
                payments.map((payment, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center border-b py-1 last:border-none"
                    >
                        <div>
                            <span className="font-semibold text-sm">{payment.title}</span>
                            <p className="text-xs text-gray-500">Due: {payment.dueDate}</p>
                        </div>
                        <span className="text-xs text-red-500">Rp. {payment.amount.toLocaleString('de-DE')}</span>
                    </div>
                ))
            ) : (
                <p className="text-xs text-gray-500">No upcoming payments.</p>
            )}
        </div>
    );
};

export default UpcomingBills;
