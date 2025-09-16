export class StudentAbsenceInfo {
    constructor(
        public readonly userId: string,
        public code: string,
        public name: string,
        public lastname: string,
        public totalAbsences: number,
    ) {}
}
            
