export default {
    template: `
    <div class="d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg" style="width: 400px;">
            <h2 class ="text-center mb-4"> Have an account ..</h2>
            <h2 class="text-center mb-4"> Pls Login</h2>

            <div class="mb-3">
                <label class="form-label"><h5>Enter Email</h5></label>
                <input type="email" class="form-control" placeholder="Email" v-model="email" required/>
            </div>

            <div class="mb-3">
                <label class="form-label"><h5>Enter Password</h5></label>
                <input type="password" class="form-control" placeholder="Password" v-model="password" required/>
            </div> 

            <button class="btn btn-primary w-100 mb-2" @click="submitLogin">Login</button>
            <p>Don't have an account. Pls sign in</p>
            <button class="btn btn-secondary w-100" @click="$router.push('/register')">Sign up</button>
    
        </div>
    </div>
    `,
    data() {     
        return {
            email: '',
            password: ''
        };
    },
    methods: {
        async submitLogin() { 
            if (!this.email || !this.password) {
                alert("Please enter both email and password.");
                return;
            }
        
           
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(this.email)) {
                alert("Invalid email format. Please enter a valid email.");
                return;
            }
            try {
                const res = await fetch(location.origin + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                const data = await res.json();
                console.log("Login Response:", data);  

                if (res.ok) {
                    localStorage.setItem('user', JSON.stringify(data));

                    this.$nextTick(() => {  
                        if (data.role === 'admin') {
                            console.log("Redirecting to /admin-dashboard");
                            this.$router.replace('/admin-dashboard');
                        } else if (data.role === 'user') {
                            console.log("Redirecting to /user-dashboard");
                            this.$router.replace('/user-dashboard');
                        } else {
                            console.error("Invalid role received:", data.role);
                            alert("Invalid role");
                        }
                    });
                } else {
                    console.error("Login failed:", data);

                    
                    const errorMsg = data.Message || data.message || 'Login failed';
                    
                    if (res.status === 404) {  
                        alert("User not found! Redirecting to Register...");
                        this.$router.push(`/register`);  
                    } else if (res.status === 400 && errorMsg.toLowerCase().includes("incorrect password")) {
                        alert("Incorrect password. Please try again."); 
                    } else {
                        alert(errorMsg);
                    }
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("Something went wrong. Please try again.");
            }
        }
    }
}
