import { create } from 'zustand';

interface Expense {
    id: string;
    name: string;
    amount: number;
    date: string;
}

interface ProjectedCost {
    category: string;
    amount: number;
}

interface BudgetState {
    totalBudget: number;
    expenses: Expense[];
    projectedCosts: ProjectedCost[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    setTotalBudget: (amount: number) => void;
    updateProjectedCost: (category: string, amount: number) => void;
    addProjectedCost: (cost: ProjectedCost) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
    totalBudget: 19000,
    expenses: [
        { id: '1', name: 'Venue Deposit', amount: 5000, date: '2024-03-15' },
        { id: '2', name: 'Catering Initial', amount: 3500, date: '2024-03-20' },
        { id: '3', name: 'DJ Booking', amount: 1200, date: '2024-03-25' },
        { id: '4', name: 'Decorations', amount: 2750, date: '2024-04-01' },
    ],
    projectedCosts: [
        { category: 'Venue', amount: 8000 },
        { category: 'Catering', amount: 6000 },
        { category: 'Entertainment', amount: 2500 },
        { category: 'Decor', amount: 3000 },
        { category: 'Logistics', amount: 1500 },
    ],
    addExpense: (expense) => set((state) => ({
        expenses: [
            { ...expense, id: Math.random().toString(36).substr(2, 9) },
            ...state.expenses
        ]
    })),
    setTotalBudget: (amount) => set({ totalBudget: amount }),
    updateProjectedCost: (category, amount) => set((state) => ({
        projectedCosts: state.projectedCosts.map(c =>
            c.category === category ? { ...c, amount } : c
        )
    })),
    addProjectedCost: (cost) => set((state) => ({
        projectedCosts: [...state.projectedCosts, cost]
    })),
}));
