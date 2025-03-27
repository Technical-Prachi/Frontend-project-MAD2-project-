export default {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Edit Subject</h2>
            <form @submit.prevent="updateSubject">
                <div class="form-group">
                    <label for="id">Subject ID</label>
                    <input type="text" class="form-control" id="id" v-model="subject.id" readonly>
                </div>
                <div class="form-group">
                    <label for="name">Subject Name</label>
                    <input type="text" class="form-control" id="name" v-model="subject.name" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea class="form-control" id="description" v-model="subject.description" rows="4" required></textarea>
                </div>
                <div class="form-group text-center">
                    <button type="submit" class="btn btn-success">Save Changes</button>
                    <button @click="goBack" class="btn btn-primary">Cancel</button>
                </div>
            </form>
        </div>
    `,
    data() {
        return {
            subject: { id: '', name: '', description: '' }
        };
    },
    methods: {
        async fetchSubject() {
            const subjectId = this.$route.params.subjectId;
            console.log("Fetching Subject with ID:", subjectId); // ✅ Debugging
        
            try {
                const res = await fetch(`${location.origin}/api/subjects/${subjectId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });
        
                console.log("Response Status:", res.status); // ✅ Debugging
        
                if (res.ok) {
                    this.subject = await res.json();
                    console.log("Fetched Subject Data:", this.subject); // ✅ Check received data
                } else {
                    const errorText = await res.text();
                    console.error("Error Response:", errorText); // ✅ Check exact API error
                    alert("Subject not found!");
                    this.$router.push("/admin-dashboard");
                }
            } catch (error) {
                console.error("Fetch Subject Error:", error);
            }
        }
        , 
        async updateSubject() {
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subject.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify({
                        name: this.subject.name,
                        description: this.subject.description
                    })
                });

                if (res.ok) {
                    alert("Subject updated successfully!");
                    this.$router.push("/admin-dashboard");
                } else {
                    alert("Failed to update subject!");
                }
            } catch (error) {
                console.error("Error updating subject:", error);
            }
        },
        goBack() {
            this.$router.push("/admin-dashboard");
        }
    }, 
    mounted() {
        this.fetchSubject();
    }
};
