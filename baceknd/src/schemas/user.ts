


export interface User {
    username: string;
    password: string;
    email: string;
    name: string;
    user_type: string;
}



export default class UserSchema {

    validate(user: User): string[] {
        const errors: string[] = [];

        if (!user.username || user.username.trim() === '') {
            errors.push('Username is required');
        }

        if (!user.password || user.password.trim() === '') {
            errors.push('Password is required');
        } else if (!this.isValidPwd(user.password)) {
            errors.push('Password is not valid');
        }

        if (!user.email || user.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(user.email)) {
            errors.push('Email is not valid');
        }

        if (!user.name || user.name.trim() === '') {
            errors.push('Name is required');
        }

        if (!user.user_type || user.user_type.trim() === '') {
            errors.push('User type is required');
        }

        return errors;
    }

    validateLoginData(username: string, password: string): string[] {

        const errors: string[] = [];

        if (!username || username.trim() === '') {
            errors.push('Username is required');
        }

        if (!password || password.trim() === '') {
            errors.push('Password is required');
        }
        if (!this.isValidPwd(password)) {
            errors.push('Password is not valid');
        }

        return errors;
    }




    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidPwd(password: string): boolean {
        // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }





}

