export default {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Add New Subject</h2>
            <form @submit.prevent="addSubject">
                <div class="form-group">
                    <label for="name">Subject Name</label>
                    <input type="text" class="form-control" id="name" v-model="subjectName" placeholder="Enter subject name" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea class="form-control" id="description" v-model="description" rows="4" placeholder="Enter subject description" required></textarea>
                </div>
                <div class="form-group text-center">
                    <button type="submit" class="btn btn-success">Add Subject</button>
                    <button @click="goBack" class="btn btn-primary">Cancel</button>
                </div>
            </form>
        </div>
    `,
    data() { 
        return {
            subjectName: '',
            description: ''
        };
    },
    methods: {
        async addSubject() {
            if (!this.subjectName.trim() || !this.description.trim()) {
                alert("Please fill out all fields.");
                return;
            }
             
            try {
                const res = await fetch(location.origin + '/api/subjects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify({
                        name: this.subjectName,
                        description: this.description
                    })
                });

                if (!res.ok) throw new Error("Failed to add subject");

                alert("Subject added successfully!");
                this.subjectName = "";
                this.description = "";
                this.$router.push("/admin-dashboard");
            } catch (error) {
                console.error("Error adding subject:", error);
                alert("Error adding subject. Please try again.");
            }
        },
        goBack() { 
            this.$router.push("/admin-dashboard");
        }
    }
};
