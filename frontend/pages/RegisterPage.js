export default {
    template: `
    <div class="d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg" style="width: 400px;">
            <h2 class="text-center mb-4">Don't have an account...</h2>
            <h2 class="text-center mb-4">Pls Register</h2>

            <div class="mb-3">
                <label class="form-label"><h5>Enter Username</h5></label>
                <input type="text" class="form-control" placeholder="Username" v-model="username" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Fullname</h5></label>
                <input type="text" class="form-control" placeholder="Full Name" v-model="fullname" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Email</h5></label>
                <input type="email" class="form-control" placeholder="Email" v-model="email" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Password</h5></label>
                <input type="password" class="form-control" placeholder="Password" v-model="password" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Qualification</h5></label>
                <input type="text" class="form-control" placeholder="Qualification" v-model="qualification" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Date of Birth</h5></label>
                <input type="date" class="form-control" v-model="dob" required/>
            </div>  

            <div class="mb-3">
                <label class="form-label"><h5>Enter Role</h5></label>
                <input type="text" class="form-control" placeholder="user" v-model="role" required/>
            </div>  

            <button class="btn btn-primary w-100 mb-2" @click="submitRegister">Register</button>
            <button class="btn btn-secondary w-100" @click="$router.push('/login')">Back to Login</button>
        </div>
    </div>
    `,
    data() {
        return {
            username: '',
            fullname: '',
            email: '',
            password: '',
            qualification: '', 
            dob: '',
            role: ''
        };
    },
    methods: {
        async submitRegister() {
            try {
                const res = await fetch(location.origin + '/register', {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username,
                        fullname: this.fullname,
                        email: this.email,
                        password: this.password,
                        qualification: this.qualification,
                        dob: this.dob,
                        role: this.role
                    })
                });
        
                const text = await res.text();  // ✅ First, get raw response text
                console.log("Raw Response:", text);
        
                try {
                    const data = JSON.parse(text);  // ✅ Try parsing JSON manually
                    console.log("Parsed JSON:", data);
                
                    if (res.ok) { 
                        alert('Registration successful! You can now log in.');
                        this.$router.push('/login');
                    } else {
                        console.error("Registration failed:", data);
                        alert(data.Message || data.message || 'Registration failed');
                    }
                } catch (jsonError) {
                    console.error("JSON Parse Error:", jsonError, text);
                    alert("Unexpected server response. Check console for details.");
                }
        
            } catch (error) {
                console.error("Register error:", error);
                alert("Something went wrong. Please try again.");
            }
        }
    }
}        