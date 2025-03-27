const store = new Vuex.Store({
  state : {
      // like data
      auth_token : null,
      role : null,
      loggedIn : false,
      user_id : null,
  },
  mutations : {
      // functions that change state
      setUser(state) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.token) {  // ✅ Check if token exists
                state.auth_token = user.token;
                state.role = user.role;
                state.loggedIn = true;
                state.user_id = user.id || user.uid || user.user_id;  // ✅ Check different key names
            } else {
                console.warn("User data is invalid");
            }
        } catch (error) {
            console.warn("Not logged in:", error);
        }
    },
    

      
        

    async logout(state) {
      if (state.auth_token && state.user_id) {
        try {
          const res = await fetchWithAuth(`/api/users/${state.user_id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            console.log("User deleted successfully.");
          } else {
            console.error("Failed to delete user.");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }

      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user_id = null;

      localStorage.removeItem("user");

      // Redirect to register page
      router.push("/");
    },
  },
});
  
  

store.commit('setUser')

export default store;