export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Your Quiz Result</h2>
        <h3>Total Marks: {{ total_scored }}</h3>
        <h3>Your Score: {{ score_gain }} / {{ total_scored }}</h3>
        <h3>Time Spent: {{ time_spent_minutes }} minutes and {{ time_spent_remaining_seconds }} seconds</h3>
    </div>
    `,
    data() {
        return {
            total_scored: 100, // Default to 100
            score_gain: 0,
            time_spent_minutes: 0,
            time_spent_remaining_seconds: 0
        };
    },
    async created() {
        try {
            const userId = this.$store?.state?.user_id || JSON.parse(localStorage.getItem("user"))?.user_id;
            const subjectId = this.$route.params.subjectId;
            const chapterId = this.$route.params.chapterId;
            const quizId = this.$route.params.quizId;

            if (!userId || !subjectId || !chapterId || !quizId) {
                throw new Error("Missing user or quiz identifiers.");
            }

            const res = await fetch(`${location.origin}/api/scores/${userId}/${subjectId}/${chapterId}/${quizId}`, {
                headers: {  
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token 
                }
            });

            if (!res.ok) throw new Error(`Failed to fetch score: ${res.statusText}`);

            const scores = await res.json();

            if (!scores || scores.length === 0) throw new Error("❌ No score data found!");

            console.log("✅ Extracted Score Object:", scores);

            // ✅ Pick the most recent score entry
            const latestScore = scores[scores.length - 1];

            this.total_scored = latestScore.total_scored ?? 100;
            this.score_gain = latestScore.score_gain ?? 0;
            this.time_spent_minutes = latestScore.time_spent_minutes ?? 0;
            this.time_spent_remaining_seconds = latestScore.time_spent_remaining_seconds ?? 0;

        } catch (error) {
            console.error("❌ Error fetching score:", error);
        }
    }
};
