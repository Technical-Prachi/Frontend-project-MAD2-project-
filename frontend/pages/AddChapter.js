export default {
    template: `
      <div class="container my-5">
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Add New Chapter</h2>
        <form @submit.prevent="addChapter">
          <div class="form-group">
            <label for="name">Chapter Name</label>
            <input type="text" class="form-control" id="name" v-model="chapter.name" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea class="form-control" id="description" v-model="chapter.description" rows="4" required></textarea>
          </div>
          <div class="form-group text-center">
            <button type="submit" class="btn btn-success">Add Chapter</button>
            <button type="button" @click="goBack" class="btn btn-primary">Cancel</button>
          </div>
        </form>
      </div>
    `,

    data() {
        return {
            chapter: {
                name: '',
                description: ''
            }
        };
    },

    computed: {
        subject_id() {
            return this.$route.params.subjectId || null; // Corrected key name
        }
    },
    

    mounted() {
        if (!this.subject_id) {
            alert("Error: Subject ID is missing. Redirecting...");
            this.$router.push("/admin_dashboard");
        }
    },

    methods: {
        async addChapter() {
            if (!this.chapter.name.trim() || !this.chapter.description.trim()) {
                alert("Please fill out all fields.");
                return;
            }

            console.log("API Request URL:", `${location.origin}/api/subjects/${this.subject_id}/chapters`);
            console.log("Request Payload:", JSON.stringify(this.chapter));

            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subject_id}/chapters`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify(this.chapter)
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("API Error Response:", errorData);
                    throw new Error(errorData.message || "Failed to add chapter");
                }

                alert("Chapter added successfully!");
                this.$router.push(`/subjects/${this.subject_id}/chapters`);
            } catch (error) {
                console.error("Error adding chapter:", error);
                alert(`Error adding chapter: ${error.message}`);
            }
        },

        goBack() {
            this.$router.push(`/subjects/${this.subject_id}/chapters`);
        }
    }
};
