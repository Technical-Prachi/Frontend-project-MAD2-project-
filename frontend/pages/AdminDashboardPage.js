export default {
    template: `
        <div class="container my-5">
        <h1 style="text-align: center;">👨‍💼 Admin Dashboard</h1>
        <!-- Search Box -->
<div class="text-center mb-4 d-flex justify-content-center">
<input 
    v-model="searchQuery" 
    type="text" 
    placeholder="🔍 Search Users, Subjects..." 
    class="form-control w-50"
/>
<button @click="searchData"  class="btn btn-primary ml-2">🔍 Search</button>
</div>
            <!-- Users Table -->
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Available Users</h2>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Full Name</th>
                        <th>Qualification</th>
                        <th>Date of Birth</th> 
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.roles }}</td> 
                        <td>{{ user.fullname }}</td>
                        <td>{{ user.qualification }}</td>
                        <td>{{ user.dob }}</td>
                        <td>
                          <button @click="toggleUserStatus(user)" class="btn" 
                          :class="user.active ? 'btn-danger' : 'btn-success'">
                          {{ user.active ? 'Block' : 'Unblock' }}
                          </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Subjects Table -->
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Manage Subjects</h2>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Subject Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="subject in subjects" :key="subject.id">
                        <td>{{ subject.id }}</td>
                        <td>{{ subject.name }}</td>
                        <td>{{ subject.description }}</td>
                        <td>
                            <button @click="editSubject(subject.id)" class="btn btn-warning">Edit</button>
                            <button @click="deleteSubject(subject.id)" class="btn btn-danger ml-2">Delete</button>
                            <button @click="checkChapters(subject.id)" class="btn btn-primary ml-2">Check Chapters</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
                <button @click="addSubject" class="btn btn-success" style="font-size: 1.2rem; padding: 8px 16px">Add Subject +</button>
            </div>

        </div>
    `, 
    data() {
        return {
            searchQuery: "", 
            users: [],
            subjects: []
        };
    },
    methods: {
        async searchData() {
            await this.fetchUsers();
            await this.fetchSubjects();
        },
        async fetchUsers() {
            try {
                let token = this.$store.state.auth_token;  
                if (!token) throw new Error("No authentication token found");

                const res = await fetch(`${location.origin}/api/admin_dashboard?search_query=${this.searchQuery}`, {
                    headers: { 'Authentication-Token': token }
                });

                const data = await res.json();
                this.users = data.users || [];

            } catch (error) {
                console.error("Error fetching Users:", error);
            }
        },

        async fetchSubjects() {
            try {
                let token = this.$store.state.auth_token;  
                if (!token) throw new Error("No authentication token found");

                const res = await fetch(`${location.origin}/api/subjects?search_query=${this.searchQuery}`, {
                    headers: { 'Authentication-Token': token }
                });
                

                const data = await res.json();
                console.log("Fetched Subjects:", data);

                if (Array.isArray(data.subjects)) {
                    this.subjects = [...data.subjects];
                } else if (Array.isArray(data)) {
                    this.subjects = [...data];
                } else {
                    console.error("Unexpected API response format:", data);
                    this.subjects = [];
                }

            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        },

        async deleteSubject(id) {
            if (!confirm("Are you sure you want to delete this subject?")) return;
            
            try {
                const token = this.$store.state.auth_token;  
                const res = await fetch(`${location.origin}/api/subjects/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authentication-Token': token }
                });

                if (!res.ok) throw new Error("Failed to delete subject");
                await this.fetchSubjects();

            } catch (error) {
                console.error("Error deleting subject:", error);
            }
        },

        async toggleUserStatus(user) {
            try {
                let token = this.$store.state.auth_token;
        
                const res = await fetch(`${location.origin}/api/users/${user.id}/toggle_status`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": token
                    }
                });
        
                console.log("Response:", res);  
        
                if (!res.ok) {
                    let errorText = await res.text();
                    throw new Error(`Failed to update user status: ${errorText}`);
                }
        
                user.active = !user.active; // Instantly update UI
        
            } catch (error) {
                console.error("Error updating user status:", error);
            }
        }
        ,
        


        addSubject() {
            this.$router.push("/subjects/add");
        },

        editSubject(id) {
            this.$router.push(`/subjects/${id}/edit`);
        },

        checkChapters(id) {
            this.$router.push(`/subjects/${id}/chapters`);
        }
    },

    async mounted() {
        await this.fetchUsers(); 
        await this.fetchSubjects();  
    }
}