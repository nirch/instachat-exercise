class UsersSidebar {
    constructor(listElement) {
        this.listElement = listElement;
    }

    update(users) {
        if (users.length === 0) {
            this.listElement.innerHTML = '<li class="empty">No one else is online</li>';
        } else {
            this.listElement.innerHTML = users
                .map(u => `<li>${escapeHtml(u)}</li>`)
                .join('');
        }
    }
}
