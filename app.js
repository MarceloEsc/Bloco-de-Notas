function salvar(texto, titulo) {
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    saveAs(blob, titulo + ".txt");
}