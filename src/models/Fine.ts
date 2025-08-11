export interface Fine {
    id: number;
    borrowId: number;
    bookTitle: string;
    fineAmount: number;
    lastUpdated: Date;
    isPaid: boolean;
}

export interface UserFine {
    userId: number;
    username: string;
    totalFinesAmount: number;
}