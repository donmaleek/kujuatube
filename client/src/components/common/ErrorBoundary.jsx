import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Client render error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="empty-state">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <a className="button primary" href="/">
            Back home
          </a>
        </section>
      );
    }

    return this.props.children;
  }
}
