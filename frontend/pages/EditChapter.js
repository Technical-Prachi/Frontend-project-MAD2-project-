export default {
  template: `
  <div class="container my-5">
    <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Edit Chapter</h2>
    <form @submit.prevent="updateChapter">
      <div class="form-group">
        <label for="id">Chapter ID</label>
        <input type="text" class="form-control" id="id" v-model="chapter.id" readonly>
      </div>
      <div class="form-group">
        <label for="name">Chapter Name</label>
        <input type="text" class="form-control" id="name" v-model="chapter.name" required>
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea class="form-control" id="description" v-model="chapter.description" rows="4" required></textarea>
      </div>
      <div class="form-group text-center">
        <button type="submit" class="btn btn-success">Save Changes</button>
        <button type="button" @click="goBack" class="btn btn-primary">Cancel</button>
      </div>
    </form>
  </div>
  `,
  data() {
    return {
      chapter: { id: '', name: '', description: '' }
    };
  },
  methods: {
    async fetchChapter() {
      const chapterId = this.$route.params.chapterId;
      console.log("Fetching Chapter ID:", chapterId); // Debugging Log
    
      try {
        const res = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
          headers: { 'Authentication-Token': this.$store.getters.authToken }
        });
    
        console.log("API Response Status:", res.status); // Debugging Log
    
        if (!res.ok) {
          throw new Error("Chapter not found!");
        }
    
        this.chapter = await res.json();
      } catch (error) {
        console.error("Fetch Chapter Error:", error);
        alert(error.message);
        this.$router.push("/admin-dashboard");
      }
    }
    ,
    
    async updateChapter() {
      const chapterId = this.$route.params.chapterId;
    
      try {
        const res = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            name: this.chapter.name.trim(),
            description: this.chapter.description.trim()
          })
        });
    
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update chapter!");
        }
    
        alert("Chapter updated successfully!");
        this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters`);

      } catch (error) {
        console.error("Error updating chapter:", error);
        alert(error.message);
      }
    }
    ,

    goBack() {
      this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters`);

    }
  },

  mounted() {
    this.fetchChapter();
  }
};
