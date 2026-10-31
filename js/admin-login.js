document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");
  const button = document.getElementById("login-button");
  const client = window.db;
  if (!client) { message.textContent = "Não foi possível iniciar o Supabase. Verifique sua conexão."; button.disabled = true; return; }
  form.addEventListener("submit", async event => {
    event.preventDefault(); message.textContent = "Verificando seus dados..."; button.disabled = true;
    try {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const {data,error} = await client.auth.signInWithPassword({email,password});
      if (error) throw error;
      const {data:admin,error:checkError} = await client.from("site_admins").select("user_id").eq("user_id",data.user.id).maybeSingle();
      if (checkError || !admin) {
        await client.auth.signOut();
        throw new Error("Este usuário não está autorizado como administrador. Consulte as instruções de configuração.");
      }
      window.location.assign("dashboard.html");
    } catch(error) {
      message.textContent = error.message || "Não foi possível entrar. Tente novamente.";
      button.disabled = false;
    }
  });
});
