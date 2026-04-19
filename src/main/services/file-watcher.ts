import { watch, type FSWatcher } from 'chokidar'

export class FileWatcher {
  private watcher: FSWatcher | null = null

  start(path: string, onChange: () => void): void {
    this.stop()
    this.watcher = watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500 }
    })
    this.watcher.on('add', onChange)
    this.watcher.on('change', onChange)
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }
}
