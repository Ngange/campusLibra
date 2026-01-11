import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingStateService {
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  /**
   * Get loading state as observable
   */
  getLoadingState(key: string): Observable<boolean> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(key)!.asObservable();
  }

  /**
   * Set loading state for a key
   */
  setLoading(key: string, isLoading: boolean): void {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(isLoading));
    } else {
      this.loadingStates.get(key)!.next(isLoading);
    }
  }

  /**
   * Check if currently loading (synchronous)
   */
  isLoading(key: string): boolean {
    if (!this.loadingStates.has(key)) {
      return false;
    }
    return this.loadingStates.get(key)!.value;
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.forEach(state => state.next(false));
  }

  /**
   * Clear specific loading state
   */
  clear(key: string): void {
    if (this.loadingStates.has(key)) {
      this.loadingStates.get(key)!.next(false);
    }
  }
}
