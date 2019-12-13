(function() {
    const modal_agreement = `
    <div class="modal" id="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">このサイトについて</p>
                <button class="delete" aria-label="close" id="hidden_modal"></button>
            </header>
            <section class="modal-card-body">
                <h3 class="is-size-3">利用規約</h3>
                <div>
                    <p>本サイトは, 無料で使用することができます. ただし, 本サイトを使用したことによる不利益が生じた場合でも, 一切の責任を負いません. </p>
                    <p>本サイトは, 予告なくを休止, あるいは停止することがありますのでご了承ください. </p>
                </div>
                <hr>
                <h3 class="is-size-3">プライバシーポリシー</h3>
                <div>
                    本サイトでは, アクセス傾向の統計的分析を把握するためにGoogle Analyticsを利用しています. 
                    クッキーをもとにして, Google社がお客様の本サイトの訪問履歴を収集、記録、分析します.  
                    Google Analyticsにより収集, 記録, 分析された情報には, 特定の個人を識別する情報は一切含まれません.
                    また, それらの情報は, Google社のプライバシーポリシーに基づいて管理されます. 
                </div>
            </section>
        </div>
    </div>
    `;

    document.getElementById('append_modal').innerHTML = modal_agreement;
    document.getElementById("show_modal").addEventListener("click", function() {
        document.getElementById("modal").classList.add('is-active');
    });
    document.getElementById("hidden_modal").addEventListener("click", function() {
        document.getElementById("modal").classList.remove('is-active');
    });
    document.getElementById("modal").addEventListener("click", function() {
        document.getElementById("modal").classList.remove('is-active');
    });
})();